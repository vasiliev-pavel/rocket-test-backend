import {
  Body,
  Controller,
  Get,
  Head,
  Header,
  Param,
  Post,
  HttpStatus,
  HttpException,
  Query,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { Lead, User, LeadWithDetails } from './leads.types';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async getLeads(@Query('query') query: string): Promise<LeadWithDetails[]> {
    if (query && query.length < 3) {
      throw new HttpException(
        'Query parameter must be at least 3 characters long',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.leadsService.getLeads(query);
  }
}
