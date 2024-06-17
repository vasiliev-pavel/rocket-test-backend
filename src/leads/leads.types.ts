// Интерфейс для сделки
export interface Lead {
  id: number;
  name: string;
  price: number;
  responsible_user_id: number;
  group_id: number;
  status_id: number;
  pipeline_id: number;
  created_at: number;
  _embedded: {
    contacts?: {
      id: number;
      is_main: boolean;
    }[];
    companies: {
      id: number;
    }[];
  };
}

// Интерфейс для ответа с массивом сделок
export interface LeadsResponse {
  _page: number;
  _links: {
    self: {
      href: string;
    };
  };
  _embedded: {
    leads: Lead[];
  };
}

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  position: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface PipelineStatus {
  id: number;
  name: string;
  pipeline_id: number;
  color: string;
  account_id: number;
}

export interface LeadWithDetails {
  id: number;
  name: string;
  price: number;
  group_id: number;
  status_id: number;
  pipeline_id: number;
  created_at: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  status: {
    id: number;
    name: string;
    color: string;
  };
  contacts: Contact[];
}
