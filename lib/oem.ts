import { api } from "./api";


export interface OEMPayload {
  name: string;
  email?: string;
  contactNumber?: string;
  contactPerson?: string;
  isActive?: boolean;
}

export const getOEMs = () => api.get("/oems");
export const createOEM = (data: OEMPayload) => api.post("/oems", data);
export const updateOEM = (id: string, data: OEMPayload) => api.put(`/oems/${id}`, data);
export const deleteOEM = (id: string) => api.delete(`/oems/${id}`);
