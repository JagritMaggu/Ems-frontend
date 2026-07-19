import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      // In a real app, you'd get the token from state or localStorage
      const token = (getState() as RootState).auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Employee', 'Dashboard', 'Organization'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Employee endpoints
    getEmployees: builder.query({
      query: (params) => ({
        url: '/employees',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Employee' as const, id })),
              { type: 'Employee', id: 'LIST' },
            ]
          : [{ type: 'Employee', id: 'LIST' }],
    }),
    
    // Dashboard endpoints
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),

    getOrganizationTree: builder.query({
      query: () => '/organization/tree',
      providesTags: ['Organization'],
    }),

    createEmployee: builder.mutation({
      query: (employeeData) => ({
        url: '/employees',
        method: 'POST',
        body: employeeData,
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }, 'Dashboard', 'Organization'],
    }),

    bulkCreateEmployees: builder.mutation({
      query: (employeesData) => ({
        url: '/employees/bulk',
        method: 'POST',
        body: employeesData,
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }, 'Dashboard', 'Organization'],
    }),

    updateEmployee: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }, 'Dashboard', 'Organization'],
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }, 'Dashboard', 'Organization'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetEmployeesQuery,
  useGetDashboardStatsQuery,
  useGetOrganizationTreeQuery,
  useCreateEmployeeMutation,
  useBulkCreateEmployeesMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = apiSlice;
