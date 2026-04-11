import colors from "../constants/colors";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useAuth } from "../../navigation/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "../services/firebaseService";
import { auth } from "../services/firebaseService";

const SettingsScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            Alert.alert("Sesión cerrada", "Has cerrado tu sesión correctamente", [
                { text: "OK", onPress: () => navigation.reset({ index: 0, routes: [{ name: 'login' }] }) }
            ]);
        } catch (error) {
            console.log("Error al cerrar sesión:", error);
            Alert.alert("Error", "No se pudo cerrar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ajustes</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>


                <text styles={styles.logoutText}>Cerrar Sesión</text>


            </TouchableOpacity>
        </View>
    );
}


//const SettingsScreen = () => {
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
//};

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.principal,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
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
