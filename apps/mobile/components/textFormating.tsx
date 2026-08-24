import { Text, View } from "react-native";

interface TextProps {
  pageHeader: string;
  subHeading: string;
}

export function Header({ pageHeader, subHeading }: TextProps) {
  return (
    <View className="flex flex-col gap-2 mt-4 ">
      <Text className="font-heading text-4xl text-gng-primary-deepShade font-bold">
        {pageHeader}
      </Text>
      <Text className="font-body text-base text-gng-muted font-medium">
        {subHeading}
      </Text>
    </View>
  );
}
