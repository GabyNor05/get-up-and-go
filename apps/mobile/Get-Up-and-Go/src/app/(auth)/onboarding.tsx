import { Button } from '@expo/ui';
import { router, Link } from 'expo-router';
import { View } from 'react-native';

const OnboardingScreen = () => {
  return (
    <View>
        
        <Link  href="/permissions">Permissions</Link>
       
    </View>
  )
}

export default OnboardingScreen