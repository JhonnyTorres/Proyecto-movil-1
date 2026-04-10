import colors from "../constants/colors";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../../navigation/AuthContext";
import { useNavigation } from "@react-navigation/native";

const SettingsScreen = () => {
    const { logout } = useAuth();
    const navigation = useNavigation();

    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Auth' }],
                        });
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text>Settings Screen</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.principal,
    },
    logoutButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 5,
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
    }
};

export default SettingsScreen;
