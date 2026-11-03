import { Link } from "@/utils/types";
import LinkCard from "@/components/link-card";
import { COLORS, QUERY_KEYS } from "@/constants";
import { API_URL } from "@/lib/auth-client";
import { getSessionToken } from "@/lib/session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Bolt } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 100;

async function fetchAllLinks(token: string): Promise<Link[]> {
  const links: Link[] = [];
  let offset = 0;
  for (;;) {
    const res = await fetch(
      `${API_URL}/api/admin/link?limit=${PAGE_SIZE}&offset=${offset}`,
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
    const page = (body.data ?? []) as Link[];
    links.push(...page);
    if (!body.pagination?.hasMore || page.length === 0) break;
    offset += page.length;
  }
  return links;
}

export default function Links() {
  const token = getSessionToken();

  const {
    data: links,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [QUERY_KEYS.LINKS],
    queryFn: async () => {
      if (!token) {
        return [] as Link[];
      }

      try {
        return await fetchAllLinks(token);
      } catch (error) {
        console.error(error);
        return [] as Link[];
      }
    },
    enabled: !!token,
    refetchInterval: 1000 * 60 * 5,
  });

  const queryClient = useQueryClient();

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LINKS] });
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.primary,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 10,
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontFamily: "MonaSans-Bold",
              fontSize: 24,
            }}
          >
            My Links
          </Text>
          <Pressable onPress={() => router.push("/config")}>
            <Bolt stroke={COLORS.text} />
          </Pressable>
        </View>
        <View
          style={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.primary,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 10,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            color: COLORS.text,
            fontFamily: "MonaSans-Bold",
            fontSize: 24,
          }}
        >
          My Links
        </Text>
        <Pressable onPress={() => router.push("/config")}>
          <Bolt stroke={COLORS.text} />
        </Pressable>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            padding: 20,
          }}
        >
          {links?.map((link, idx) => <LinkCard key={idx} {...link} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
