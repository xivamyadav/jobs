import { useState, useEffect } from 'react';
import { getCompanyProfile } from '../api/company';
import { Company } from '../types';

export const companyKeys = {
  all: ['company'] as const,
  profile: () => [...companyKeys.all, 'profile'] as const,
  detail: () => [...companyKeys.all, 'detail'] as const,
};

export const useCompanyProfile = () => {
  const [data, setData] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await getCompanyProfile();
      setData(res.data || res);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { data, isLoading, error, refetch: fetchProfile };
};
