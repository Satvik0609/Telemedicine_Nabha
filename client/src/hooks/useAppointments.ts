import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export function useAppointments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const response = await fetch(`/api/appointments?patientId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOnlineDoctors() {
  return useQuery({
    queryKey: ['doctors', 'online'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/doctors?online=true');
        if (!response.ok) {
          throw new Error('Failed to fetch online doctors');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching online doctors:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/doctors');
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useHealthRecords() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['health-records', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const response = await fetch(`/api/health-records?patientId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch health records');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching health records:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSymptomChecks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['symptom-checks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const response = await fetch(`/api/symptom-checks?patientId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch symptom checks');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching symptom checks:', error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMedicines() {
  return useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/medicines');
        if (!response.ok) {
          throw new Error('Failed to fetch medicines');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching medicines:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useMedicineStock() {
  return useQuery({
    queryKey: ['medicine-stock'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/medicine-stock');
        if (!response.ok) {
          throw new Error('Failed to fetch medicine stock');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching medicine stock:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
