import {View, Text, Button} from 'react-native';
import {Redirect} from 'expo-router';

const isNewUser = false;

const LoginScreen = () => {
    if(!isNewUser){
        return <Redirect href="/signup"/>
    }
  return (
    <View>
        <Text> Login screen</Text>
        <Button title ="Sign Up" onPress={() =>{}}/>
        <Button title ="Sign In" onPress={() =>{}}/>
    </View>
  )
}

export default LoginScreen