import { create } from 'zustand';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { Collection, Record } from '../types';

interface CollectionState {
    collections: Collection[];
    currentCollection: Collection | null;
    records: Record[];
    isLoading: boolean;
    fetchCollections: () => Promise<void>;
    fetchCollection: (id: string) => Promise<void>;
    createCollection: (name: string, description: string) => Promise<void>;
    updateCollection: (id: string, name: string, description: string) => Promise<void>;
    deleteCollection: (id: string) => Promise<void>;
    fetchRecords: (collectionId: string) => Promise<void>;
    createRecord: (collectionId: string, data: Record<string, any>) => Promise<void>;
    updateRecord: (collectionId: string, recordId: string, data: Record<string, any>) => Promise<void>;
    deleteRecord: (collectionId: string, recordId: string) => Promise<void>;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
    collections: [],
    currentCollection: null,
    records: [],
    isLoading: false,

    fetchCollections: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/collections');
            // Sort by newest first (created_at descending)
            const sortedData = (data || []).sort((a: Collection, b: Collection) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            set({ collections: sortedData, isLoading: false });
        } catch (error: any) {
            toast.error('Failed to load collections');
            set({ isLoading: false });
        }
    },

    fetchCollection: async (id: string) => {
        set({ isLoading: true });
        try {
            const { data } = await api.get(`/collections/${id}`);
            set({ currentCollection: data, isLoading: false });
        } catch (error: any) {
            toast.error('Failed to load collection');
            set({ isLoading: false });
        }
    },

    createCollection: async (name: string, description: string = '', fields?: any[], exampleItems?: any[]) => {
        try {
            const schema = fields ? { fields } : undefined;
            const { data: collection } = await api.post('/collections', {
                name,
                description,
                schema
            });

            // Auto-create example items if provided
            if (exampleItems && exampleItems.length > 0 && collection.id) {
                for (const item of exampleItems) {
                    await api.post(`/collections/${collection.id}/records`, { data: item });
                }
            }

            // Add new folder at the beginning (newest first)
            set((state) => ({
                collections: [collection, ...state.collections]
            }));
            toast.success('Folder created successfully!');
            return collection;
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to create folder');
            throw error;
        }
    },

    updateCollection: async (id: string, name: string, description: string) => {
        try {
            const { data } = await api.put(`/collections/${id}`, { name, description });
            set({
                collections: get().collections.map((c) => (c.id === id ? data : c)),
                currentCollection: get().currentCollection?.id === id ? data : get().currentCollection,
            });
            toast.success('Collection updated!');
        } catch (error: any) {
            toast.error('Failed to update collection');
            throw error;
        }
    },

    deleteCollection: async (id: string) => {
        try {
            await api.delete(`/collections/${id}`);
            set({ collections: get().collections.filter((c) => c.id !== id) });
            toast.success('Collection deleted');
        } catch (error: any) {
            toast.error('Failed to delete collection');
            throw error;
        }
    },

    fetchRecords: async (collectionId: string) => {
        set({ isLoading: true });
        try {
            const { data } = await api.get(`/collections/${collectionId}/records`);
            set({ records: data, isLoading: false });
        } catch (error: any) {
            toast.error('Failed to load records');
            set({ isLoading: false });
        }
    },

    createRecord: async (collectionId: string, data: Record<string, any>) => {
        try {
            const response = await api.post(`/collections/${collectionId}/records`, { data });
            set({ records: [response.data, ...get().records] });
            toast.success('Record created!');
        } catch (error: any) {
            toast.error('Failed to create record');
            throw error;
        }
    },

    updateRecord: async (collectionId: string, recordId: string, data: Record<string, any>) => {
        try {
            const response = await api.put(`/collections/${collectionId}/records/${recordId}`, { data });
            set({
                records: get().records.map((r) => (r.id === recordId ? response.data : r)),
            });
            toast.success('Record updated!');
        } catch (error: any) {
            toast.error('Failed to update record');
            throw error;
        }
    },

    deleteRecord: async (collectionId: string, recordId: string) => {
        try {
            await api.delete(`/collections/${collectionId}/records/${recordId}`);
            set({ records: get().records.filter((r) => r.id !== recordId) });
            toast.success('Record deleted');
        } catch (error: any) {
            toast.error('Failed to delete record');
            throw error;
        }
    },
}));
