export interface User {
    id: string;
    email: string;
    full_name: string;
    email_verified: boolean;
    is_active: boolean;
    created_at: string;
    last_login: string | null;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
}

export interface Collection {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    schema: Record<string, any> | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    record_count?: number;
}

export interface Record {
    id: string;
    collection_id: string;
    data: Record<string, any>;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface ActivityLog {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    changes: Record<string, any> | null;
    ip_address: string | null;
    created_at: string;
}

export interface ApiError {
    error: string;
    detail?: string;
    field?: string;
}
