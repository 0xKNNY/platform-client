import useSaveMetadata, {
  UseSaveMetadataType,
} from "@/hooks/platform/useSaveMetadata";
import { Platform, useMetadata } from "@artiva/shared";
import { useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { createContainer } from "unstated-next";
import { isEqual } from "lodash";

export type UseMetadataContextType = {
  merge: (platform: Partial<Platform>) => void;
  mutate: (platform: Platform) => void;
  changeCount: number;
  save: UseSaveMetadataType;
  data: Platform | undefined;
};

const useMetadataContext = (): UseMetadataContextType => {
  const { data: initalData } = useMetadata();
  const [data, setData] = useState<Platform>();
  const [changeCount, setChangeCount] = useState(0);
  const swr = useSWRConfig();
  const save = useSaveMetadata({
    data,
    onSettled: () => {
      setChangeCount(0);
      swr.mutate("/api/platform/meta", undefined, {
        optimisticData: data,
        revalidate: false,
      });
    },
  });

  const merge = (platform: Partial<Platform>) => {
    if (!data) return;
    mutate({
      ...data,
      ...platform,
    });
  };

  const mutate = (platform: Platform) => {
    setData(platform);
    return platform;
  };

  useEffect(() => {
    if (!data) setData(initalData);
  }, [data, initalData]);

  useEffect(() => {
    if (!data || !initalData) return;
    let count = 0;
    Object.keys(data).map((x) => {
      console.log("Comparing", (data as any)[x], (initalData as any)[x]);
      if (isEqual((data as any)[x], (initalData as any)[x])) return;
      count++;
    });
    setChangeCount(count);
  }, [initalData, data]);

  return { merge, mutate, changeCount, save, data };
};

export default createContainer<UseMetadataContextType>(useMetadataContext);