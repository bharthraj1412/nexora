"""
File import service for parsing CSV and Excel files.
Handles file validation, parsing, and data type detection.
"""
import io
import os
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
import pandas as pd
from fastapi import UploadFile, HTTPException


# Maximum file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Supported file extensions
SUPPORTED_EXTENSIONS = {'.csv', '.xlsx'}


def validate_file(file: UploadFile) -> None:
    """
    Validate uploaded file.
    Raises HTTPException if validation fails.
    """
    # Check file extension
    file_ext = os.path.splitext(file.filename or '')[1].lower()
    if file_ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Please upload CSV or Excel (.xlsx) files only."
        )
    
    # File size will be checked during read


def detect_field_type(series: pd.Series) -> str:
    """
    Detect the most appropriate field type for a pandas Series.
    Returns: 'number', 'date', or 'text'
    """
    # Skip empty series
    if series.isna().all():
        return 'text'
    
    # Try to detect numeric
    try:
        pd.to_numeric(series.dropna())
        return 'number'
    except (ValueError, TypeError):
        pass
    
    # Try to detect date
    try:
        pd.to_datetime(series.dropna())
        # Check if it looks like dates (not just numbers that can be parsed as dates)
        if not series.dropna().astype(str).str.match(r'^\d+$').all():
            return 'date'
    except (ValueError, TypeError, AttributeError):
        pass
    
    return 'text'


def parse_csv_file(file_content: bytes) -> pd.DataFrame:
    """
    Parse CSV file content into DataFrame.
    """
    try:
        df = pd.read_csv(io.BytesIO(file_content))
        return df
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse CSV file: {str(e)}"
        )


def parse_excel_file(file_content: bytes) -> pd.DataFrame:
    """
    Parse Excel file content into DataFrame.
    """
    try:
        df = pd.read_excel(io.BytesIO(file_content), engine='openpyxl')
        return df
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse Excel file: {str(e)}"
        )


async def parse_file(file: UploadFile) -> Tuple[pd.DataFrame, str]:
    """
    Parse uploaded file and return DataFrame and file extension.
    
    Returns:
        Tuple of (DataFrame, file_extension)
    """
    # Validate file
    validate_file(file)
    
    # Read file content
    file_content = await file.read()
    
    # Check file size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.0f}MB."
        )
    
    # Determine file type and parse
    file_ext = os.path.splitext(file.filename or '')[1].lower()
    
    if file_ext == '.csv':
        df = parse_csv_file(file_content)
    elif file_ext == '.xlsx':
        df = parse_excel_file(file_content)
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )
    
    # Validate DataFrame
    if df.empty:
        raise HTTPException(
            status_code=400,
            detail="File is empty or contains no data"
        )
    
    if len(df.columns) == 0:
        raise HTTPException(
            status_code=400,
            detail="File contains no columns"
        )
    
    return df, file_ext


def generate_schema_from_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate collection schema from DataFrame columns.
    Auto-detects field types.
    
    Returns:
        Dictionary with 'fields' key containing field definitions
    """
    fields = []
    
    for column in df.columns:
        # Clean column name
        field_name = str(column).strip().lower().replace(' ', '_').replace('-', '_')
        if not field_name:
            field_name = f'column_{len(fields)}'
        
        # Detect field type
        field_type = detect_field_type(df[column])
        
        # Create field definition
        field = {
            'name': field_name,
            'type': field_type,
            'label': str(column).strip(),
            'required': False
        }
        
        fields.append(field)
    
    return {'fields': fields}


def dataframe_to_records(df: pd.DataFrame, schema: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Convert DataFrame rows to record dictionaries using the schema.
    
    Returns:
        List of record data dictionaries
    """
    records = []
    fields = schema.get('fields', [])
    
    for _, row in df.iterrows():
        record_data = {}
        
        for i, (column, value) in enumerate(row.items()):
            if i < len(fields):
                field = fields[i]
                field_name = field['name']
                field_type = field['type']
                
                # Handle empty/null values
                if pd.isna(value):
                    continue
                
                # Convert value based on field type
                try:
                    if field_type == 'number':
                        record_data[field_name] = float(value) if '.' in str(value) else int(value)
                    elif field_type == 'date':
                        # Convert to ISO format string
                        if isinstance(value, (pd.Timestamp, datetime)):
                            record_data[field_name] = value.strftime('%Y-%m-%d')
                        else:
                            date_obj = pd.to_datetime(value)
                            record_data[field_name] = date_obj.strftime('%Y-%m-%d')
                    else:  # text
                        record_data[field_name] = str(value).strip()
                except Exception:
                    # Fallback to string representation
                    record_data[field_name] = str(value).strip()
        
        # Only add non-empty records
        if record_data:
            records.append(record_data)
    
    return records


async def process_import_file(file: UploadFile, preview_only: bool = False) -> Dict[str, Any]:
    """
    Process uploaded file and prepare import data.
    
    Args:
        file: The uploaded file
        preview_only: If True, only returns preview and stats, skips full record parsing if possible.
                      (Current implementation still parses full DF but avoids returning records list)
    
    Returns:
        Dictionary containing schema, preview, and stats.
        'records' is included only if preview_only=False.
    """
    # Parse file
    df, file_ext = await parse_file(file)
    
    # Generate folder name from filename
    filename_without_ext = os.path.splitext(file.filename or 'imported_data')[0]
    folder_name = filename_without_ext.replace('_', ' ').replace('-', ' ').title()
    
    # Generate schema
    schema = generate_schema_from_dataframe(df)
    
    # Calculate totals
    total_rows = len(df)
    total_columns = len(schema.get('fields', []))
    
    # Prepare preview (limit to first 5)
    # Convert only the head to records for efficiency
    preview_df = df.head(5)
    preview = dataframe_to_records(preview_df, schema)
    
    result = {
        'folder_name': folder_name,
        'schema': schema,
        'preview': preview,
        'total_rows': total_rows,
        'total_columns': total_columns
    }

    if not preview_only:
        # Convert all to records
        records = dataframe_to_records(df, schema)
        if not records:
             raise HTTPException(
                status_code=400,
                detail="No valid data found in file"
            )
        result['records'] = records

    return result
