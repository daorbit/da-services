import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type RegisteredApp = {
  id: string;
  slug: string;
  name: string;
  dbName: string;
  active: boolean;
  createdAt: string;
};

export function useApps() {
  const [apps, setApps] = useState<RegisteredApp[]>([]);
  const [loading, setLoading] = useState(true);

  function reload() {
    setLoading(true);
    api.get("/apps").then(({ data }) => {
      setApps(data.apps);
      setLoading(false);
    });
  }

  useEffect(reload, []);

  return { apps, loading, reload };
}
