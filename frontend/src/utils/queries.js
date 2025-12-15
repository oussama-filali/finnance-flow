import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsAPI, categoriesAPI, importAPI } from '../services/endpoints'

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data } = await transactionsAPI.getAll()
      return data
    }
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transactionsAPI.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => transactionsAPI.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transactionsAPI.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await categoriesAPI.getAll()
      return data
    }
  })
}

export const useImport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: importAPI.upload,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
  })
}
