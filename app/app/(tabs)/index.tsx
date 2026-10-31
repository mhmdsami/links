import Button from "@/components/button";
import Input from "@/components/input";
import { COLORS, QUERY_KEYS } from "@/constants";
import { API_URL } from "@/lib/auth-client";
import { getSessionToken } from "@/lib/session";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { showInfo } from "@/utils";

export default function Index() {
  const token = getSessionToken();

  const createLinkSchema = z.object({
    url: z.string().url(),
    code: z.string().min(1),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      url: "",
      code: "",
    },
    resolver: zodResolver(createLinkSchema),
  });

  const queryClient = useQueryClient();

  const { mutate: create, isPending } = useMutation({
    mutationKey: [QUERY_KEYS.CREATE],
    mutationFn: async (data: z.infer<typeof createLinkSchema>) => {
      if (!token) {
        throw new Error("Session missing — sign in again");
      }

      const res = await fetch(`${API_URL}/admin/link/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "Session expired — sign in again"
            : "Could not create link",
        );
      }
    },
    onSuccess: () => {
      reset();
      showInfo("Link created");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINKS] });
    },
    onError: (error) => {
      console.error(error);
      showInfo(error.message);
    },
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.primary,
      }}
    >
      <View
        style={{
          display: "flex",
          gap: 10,
          width: "80%",
          alignItems: "center",
        }}
      >
        <Controller
          control={control}
          name="url"
          render={({ field }) => (
            <Input
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Enter URL"
            />
          )}
        />
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <Input
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Short code"
            />
          )}
        />
        <Button
          disabled={!isValid || isPending}
          onPress={handleSubmit((data) => create(data))}
        >
          Create
        </Button>
      </View>
    </SafeAreaView>
  );
}
