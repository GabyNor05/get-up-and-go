import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Pressable
} from "react-native";
import { router } from 'expo-router';
import { Image, Plus} from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 1. Define Validation Schema with Zod
const signUpSchema = z.object({
  fullName: z.string(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    // Call your authentication backend here (e.g. Firebase, Supabase, API)
    console.log("Form Submitted:", data);
    router.push('/onboarding');
  };

  return (
    <View className="flex-1 justify-center px-6 bg-gng-bg-light dark:bg-gng-bg-dark">
      <Text className="text-2xl font-bold mb-6 text-gng-text-light dark:text-gng-text-dark">
        Create Account
      </Text>
        <View>
        <View className="size-24 bg-slate-400 rounded-full">
          <Image size={40} />
        </View>
        <Pressable className="size-12 bg-gng-primary-deepShade-light dark:bg-gng-primary-deepShade-dark">
          <Plus size={24} />
        </Pressable>
      </View>
      <View>
        {/* NAME FIELD */}
        <View className="mb-4">
          <Text className="mb-1 text-sm font-medium text-gng-text-light dark:text-gng-text-dark">
            Full Name
          </Text>
          
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 dark:border-gray-700 p-3 rounded-lg text-black dark:text-white"
                placeholder="name@example.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </Text>
          )}
        </View>

        {/* EMAIL FIELD */}
        <View className="mb-4">
          <Text className="mb-1 text-sm font-medium text-gng-text-light dark:text-gng-text-dark">
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 dark:border-gray-700 p-3 rounded-lg text-black dark:text-white"
                placeholder="name@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </Text>
          )}
        </View>

        {/* PASSWORD FIELD */}
        <View className="mb-4">
          <Text className="mb-1 text-sm font-medium text-gng-text-light dark:text-gng-text-dark">
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 dark:border-gray-700 p-3 rounded-lg text-black dark:text-white"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.password && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="bg-black dark:bg-white p-4 rounded-lg items-center"
        >
          {isSubmitting ? (
            <ActivityIndicator color={true ? "#fff" : "#000"} />
          ) : (
            <Text className="text-white dark:text-black font-semibold">
              Sign Up
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
