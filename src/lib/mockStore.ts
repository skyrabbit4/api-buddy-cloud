export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface MockEndpoint {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  responseBody: string;
  delay: number;
  createdAt: string;
  isActive: boolean;
}

const STORAGE_KEY = "mockapi_endpoints";

export const generateId = () => Math.random().toString(36).substring(2, 10);

export const getEndpoints = (): MockEndpoint[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEndpoints = (endpoints: MockEndpoint[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(endpoints));
};

export const addEndpoint = (endpoint: Omit<MockEndpoint, "id" | "createdAt" | "isActive">): MockEndpoint => {
  const newEndpoint: MockEndpoint = {
    ...endpoint,
    id: generateId(),
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  const endpoints = getEndpoints();
  endpoints.push(newEndpoint);
  saveEndpoints(endpoints);
  return newEndpoint;
};

export const deleteEndpoint = (id: string) => {
  const endpoints = getEndpoints().filter((e) => e.id !== id);
  saveEndpoints(endpoints);
};

export const toggleEndpoint = (id: string) => {
  const endpoints = getEndpoints().map((e) =>
    e.id === id ? { ...e, isActive: !e.isActive } : e
  );
  saveEndpoints(endpoints);
};

export const updateEndpoint = (id: string, updates: Partial<MockEndpoint>) => {
  const endpoints = getEndpoints().map((e) =>
    e.id === id ? { ...e, ...updates } : e
  );
  saveEndpoints(endpoints);
};
