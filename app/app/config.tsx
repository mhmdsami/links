import Button from "@/components/button";
import { COLORS } from "@/constants";
import { API_URL, authClient } from "@/lib/auth-client";
import { isSignedIn, persistSessionToken, signOut } from "@/lib/session";
import { showInfo } from "@/utils";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Config() {
  const { data: session } = authClient.useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signedIn, setSignedIn] = useState(isSignedIn);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        throw new Error(error.message ?? "Google sign-in failed");
      }

      const token = await persistSessionToken();
      if (!token) {
        throw new Error("Google sign-in did not return a session");
      }

      showInfo("Signed in");
      setSignedIn(true);
      router.replace("/");
    } catch (error) {
      console.error(error);
      showInfo(error instanceof Error ? error.message : "Sign-in failed");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSignedIn(false);
    showInfo("Signed out");
  };

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
          Config
        </Text>
      </View>
      <View
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
            gap: 16,
            width: "80%",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontFamily: "MonaSans-Medium",
              textAlign: "center",
            }}
          >
            {session?.user?.email
              ? `Signed in as ${session.user.email}`
              : signedIn
                ? "Signed in"
                : "Sign in with Google to manage your links."}
          </Text>
          <Text
            style={{
              color: COLORS.highlight,
              fontFamily: "MonaSans-Medium",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {API_URL}
          </Text>
          {signedIn ? (
            <>
              <Button onPress={() => router.replace("/")}>My Links</Button>
              <Button variant="destructive" onPress={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button onPress={handleSignIn} disabled={isSigningIn}>
              {isSigningIn ? "Signing in..." : "Continue with Google"}
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
