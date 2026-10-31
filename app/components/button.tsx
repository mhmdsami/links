import { COLORS } from "@/constants";
import { Pressable, StyleProp, Text, ViewStyle } from "react-native";

interface ButtonProps
  extends Omit<React.ComponentProps<typeof Pressable>, "onPress" | "children"> {
  children: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "destructive";
}

export default function Button({
  style,
  children,
  variant = "primary",
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      style={[
        {
          backgroundColor: COLORS.secondary,
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: COLORS.highlight,
          width: "auto",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      disabled={disabled}
      onPress={onPress}
      {...props}
    >
      <Text
        style={{
          color: variant === "destructive" ? COLORS.danger : COLORS.text,
          fontFamily: "MonaSans-Bold",
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
