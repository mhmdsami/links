import Button from "@/components/button";
import Input from "@/components/input";
import { COLORS, QUERY_KEYS } from "@/constants";
import { API_URL } from "@/lib/auth-client";
import { getSessionToken } from "@/lib/session";
import { showInfo } from "@/utils";
import { Link } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

export default function EditLink() {
  const { code } = useLocalSearchParams();

  const isPresented = router.canGoBack();

  const token = getSessionToken();

  const { data: link } = useQuery({
    queryKey: [QUERY_KEYS.LINKS, code],
    queryFn: async () => {
      if (!token) {
        return null;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/admin/link/${encodeURIComponent(String(code))}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error(`Request failed with ${res.status}`);
        }

        const body = await res.json();

        return (body.data ?? null) as Link | null;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    enabled: !!token && !!code,
  });

  const queryClient = useQueryClient();

  const { mutate: updateLink, isPending } = useMutation({
    mutationKey: [QUERY_KEYS.UPDATE, code],
    mutationFn: async (url: string) => {
      const res = await fetch(`${API_URL}/api/admin/link/${code}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "Session expired — sign in again"
            : "Could not update link",
        );
      }
    },
    onSuccess: () => {
      showInfo("Link updated");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINKS] });
    },
    onError: (error) => {
      console.error(error);
      showInfo(error.message);
    },
  });

  const updateLinkSchema = z.object({
    url: z.string().url(),
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm({
    defaultValues: {
      url: link?.url || "",
    },
    resolver: zodResolver(updateLinkSchema),
  });

  if (!link) return null;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.primary,
      }}
    >
      <View>
        <Text
          style={{
            color: COLORS.text,
            fontSize: 20,
            textAlign: "center",
            fontFamily: "MonaSans-Bold",
          }}
        >
          Edit Link
        </Text>
        <View
          style={{
            position: "absolute",
            right: 20,
          }}
        >
          {isPresented && (
            <X stroke={COLORS.text} onPress={() => router.back()} />
          )}
        </View>
      </View>
      <View
        style={{
          flex: 1,
          padding: 20,
          gap: 10,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            padding: 10,
            backgroundColor: COLORS.tertiary,
            borderRadius: 10,
            borderColor: COLORS.highlight,
            borderWidth: 1,
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontFamily: "MonaSans-SemiBold",
              overflow: "scroll",
              height: 20,
            }}
          >
            {link.code}
          </Text>
        </View>
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
        <Button
          disabled={!isValid || !isDirty || isPending}
          onPress={handleSubmit(({ url }) => updateLink(url))}
          style={{
            alignSelf: "center",
          }}
        >
          Update
        </Button>
      </View>
    </SafeAreaView>
  );
}
