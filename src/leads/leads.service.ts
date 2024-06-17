import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import {
  Lead,
  LeadsResponse,
  User,
  LeadWithDetails,
  Contact,
  PipelineStatus,
} from './leads.types';

@Injectable()
export class LeadsService {
  constructor(private readonly httpService: HttpService) {}

  private readonly baseURL = process.env.BASE_URL;
  private readonly token = process.env.ACCESS_TOKEN;

  async getLeads(query?: string): Promise<LeadWithDetails[]> {
    try {
      const params = {
        query,
        with: 'contacts',
      };
      const headers = { Authorization: `Bearer ${this.token}` };

      const leadsResponse: AxiosResponse<LeadsResponse> = await firstValueFrom(
        this.httpService.get<LeadsResponse>(`${this.baseURL}/api/v4/leads`, {
          headers,
          params,
        }),
      );

      if (leadsResponse.status === 204) {
        return [];
      }

      const leadsData = [];
      for (const lead of leadsResponse.data._embedded.leads) {
        const user: User = await this.getUser(lead.responsible_user_id);
        const status: PipelineStatus = await this.getStatus(
          lead.pipeline_id,
          lead.status_id,
        );
        const contacts: Contact[] = await Promise.all(
          (lead._embedded.contacts || [])
            .filter((contact) => contact.is_main)
            .map((contact) => this.getContact(contact.id)),
        );

        leadsData.push({
          id: lead.id,
          name: lead.name,
          price: lead.price,
          group_id: lead.group_id,
          status_id: lead.status_id,
          pipeline_id: lead.pipeline_id,
          created_at: lead.created_at,
          responsible_user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          status: {
            id: status.id,
            name: status.name,
            color: status.color,
          },
          contacts,
        });
      }

      return leadsData;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch leads from amoCRM',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUser(userId: number): Promise<User> {
    return firstValueFrom(
      this.httpService.get<User>(`${this.baseURL}/api/v4/users/${userId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      }),
    ).then((response) => response.data);
  }

  async getStatus(
    pipelineId: number,
    statusId: number,
  ): Promise<PipelineStatus> {
    return firstValueFrom(
      this.httpService.get<PipelineStatus>(
        `${this.baseURL}/api/v4/leads/pipelines/${pipelineId}/statuses/${statusId}`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        },
      ),
    ).then((response) => response.data);
  }

  async getContact(contactId: number): Promise<Contact> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseURL}/api/v4/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      }),
    );

    return this.transformContact(response.data);
  }

  private transformContact(rawContact: any): Contact {
    const phone = this.extractCustomFieldValue(
      rawContact.custom_fields_values,
      'PHONE',
    );
    const email = this.extractCustomFieldValue(
      rawContact.custom_fields_values,
      'EMAIL',
    );
    const position = this.extractCustomFieldValue(
      rawContact.custom_fields_values,
      'POSITION',
    );

    return {
      id: rawContact.id,
      name: rawContact.name,
      phone: phone || '',
      email: email || '',
      position: position || '',
    };
  }

  private extractCustomFieldValue(
    customFields: any[],
    fieldCode: string,
  ): string | undefined {
    const field = customFields.find((f) => f.field_code === fieldCode);
    return field?.values?.[0]?.value;
  }
}
