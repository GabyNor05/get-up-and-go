import { View, Text } from 'react-native';
import { router, Link } from 'expo-router';

const PermissionsScreen = () => {
    
  return (
    <View>
        <Text>Permisions Screen</Text>
        <Link  href="../(main)">Permissions</Link>
    </View>
  )
}

export default PermissionsScreen