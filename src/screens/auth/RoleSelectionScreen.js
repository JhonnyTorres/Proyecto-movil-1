import { useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../services/firebaseService";
import colors from "../../constants/colors";

const ROLES = [
    {
        id: 'cliente',
        label: 'Cliente',
        description: 'Busco servicios para mi hogar',
        icon: 'home-outline',
    },
    {
        id: 'profesional',
        label: 'Profesional',
        description: 'Ofrezco servicios del hogar',
        icon: 'construct-outline',
    },
];

const RoleSelectionScreen = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const { name, email, password } = route.params;

    const handleContinue = async () => {
        if (!selectedRole) {
            Alert.alert('Selecciona un rol', 'Por favor elige si eres Cliente o Profesional.');
            return;
        }

        // Si es profesional, navegar a la pantalla de perfil profesional
        if (selectedRole === 'profesional') {
            navigation.navigate('ProfessionalProfile', { name, email, password });
            return;
        }

        // Si es cliente, crear el usuario directamente
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            await setDoc(doc(db, 'usuarios', user.uid), {
                uid: user.uid,
                nombre: name,
                email: email,
                rol: 'cliente',
                creadoEn: serverTimestamp(),
            });

            Alert.alert('¡Registro exitoso!', 'Tu cuenta ha sido creada.');
            // El AuthContext detecta el usuario y redirige automáticamente

        } catch (error) {
            let errorMessage = 'Error al registrar usuario';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Ya existe una cuenta con este correo electrónico';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'El formato del correo electrónico no es válido';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña es muy débil';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Error de conexión. Verifica tu internet';
                    break;
                default:
                    errorMessage = `${error.message || 'Error desconocido'} (Código: ${error.code})`;
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={colors.gradientePrimario} style={styles.container}>
            <View style={styles.formContainer}>

                <Text style={styles.title}>¿Cómo usarás la app?</Text>
                <Text style={styles.subtitle}>Elige tu rol para continuar</Text>

                {ROLES.map((role) => {
                    const isSelected = selectedRole === role.id;
                    return (
                        <TouchableOpacity
                            key={role.id}
                            style={[styles.card, isSelected && styles.cardSelected]}
                            onPress={() => setSelectedRole(role.id)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                                <Ionicons
                                    name={role.icon}
                                    size={26}
                                    color={isSelected ? colors.iluminado : colors.suave}
                                />
                            </View>

                            <View style={styles.cardText}>
                                <Text style={[styles.roleLabel, isSelected && styles.roleLabelSelected]}>
                                    {role.label}
                                </Text>
                                <Text style={[styles.roleDesc, isSelected && styles.roleDescSelected]}>
                                    {role.description}
                                </Text>
                            </View>

                            <View style={[styles.radio, isSelected && styles.radioSelected]}>
                                {isSelected && <View style={styles.radioDot} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {/* Indicador de paso extra para profesional */}
                {selectedRole === 'profesional' && (
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.iluminado} />
                        <Text style={styles.infoText}>
                            En el siguiente paso podrás configurar tus servicios y experiencia.
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.registerButton, (!selectedRole || loading) && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={!selectedRole || loading}
                >
                    {loading
                        ? <ActivityIndicator color={colors.iluminado} />
                        : <Text style={styles.buttonText}>
                            {selectedRole === 'profesional' ? 'Continuar →' : 'Registrarse'}
                        </Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.linkText}>← Volver</Text>
                </TouchableOpacity>

            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.iluminado,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: colors.suave,
        marginBottom: 28,
        textAlign: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'transparent',
        padding: 16,
        marginBottom: 14,
        width: '100%',
        gap: 14,
    },
    cardSelected: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderColor: colors.iluminado,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircleSelected: {
        backgroundColor: colors.variante5,
    },
    cardText: {
        flex: 1,
    },
    roleLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.suave,
    },
    roleLabelSelected: {
        color: colors.iluminado,
    },
    roleDesc: {
        fontSize: 13,
        color: colors.suave,
        marginTop: 2,
        opacity: 0.8,
    },
    roleDescSelected: {
        color: colors.iluminado,
        opacity: 0.9,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: colors.suave,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: colors.iluminado,
        backgroundColor: colors.variante5,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.iluminado,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: 12,
        width: '100%',
        marginBottom: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: colors.iluminado,
        lineHeight: 18,
    },
    registerButton: {
        backgroundColor: colors.variante5,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: colors.iluminado,
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: colors.iluminado,
        fontSize: 15,
        textDecorationLine: 'underline',
        marginTop: 4,
    },
});

export default RoleSelectionScreen;