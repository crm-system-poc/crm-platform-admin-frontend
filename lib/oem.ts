import { api } from "./api";


export const getOEMs = () => api.get("/oems");
export const createOEM = (data: any) => api.post("/oems", data);
export const updateOEM = (id: string, data: any) => api.put(`/oems/${id}`, data);
export const deleteOEM = (id: string) => api.delete(`/oems/${id}`);
