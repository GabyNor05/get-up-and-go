import {Stack } from 'expo-router';


export default function AuthLayout(){
    return(
        <Stack  >
            <Stack.Screen name='index' options={{ headerShown: false }}  />
            <Stack.Screen name='signup'/>
            <Stack.Screen name='onboarding'/>
            <Stack.Screen name='permissions'/>
        </Stack>
    );
}