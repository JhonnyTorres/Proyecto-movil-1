import { use, useCallback, useState } from "react";
import colors from "../constants/colors";
import { View, Text, Alert, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView } from "react-native/types_generated/index";

const UserScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { imageUri, setImageUri } = useState(null);
    const { userData, setUserData } = useState(null);
    const { loading, setLoading } = useState(false);
    const { selectedImage, setSelectedImage } = useState(null);
    const { showPreview, setShowPreview } = useState(false);
    const defaultImage = ''; //Url imagen por defecto

    const fetchUserProfile = useCallback(async () => {
        if (user) {
            setLoading(true);
            try {
                const firestoreUserData = await getUserData(user.uid);
                setUserData(firestoreUserData);
                setImageUri(firestoreUserData?.photoURL || user.photoURL || defaultImage);
            } catch (error) {
                console.error("Error al obtener los datos del perfil: ", error);
                setImageUri(user.photoURL || defaultImage);
            } finally {
                setLoading(false);
            }
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [fetchUserProfile])
    );

    const handlerImageSelection = async () => {
        try {
            const imageAsset = await pickImage();
            if (imageAsset) {
                setSelectedImage(imageAsset);
                setShowPreview(true);
            }
        } catch (error) {
            console.error("Error al seleccionar la imagen: ", error);
            Alert.alert('Error', 'No se pudo seleccionar la imagen.')
        }
    };

    const handlerCancelSelection = () => {
        setSelectedImage(null);
        setShowPreview(false);
    };

    const handlerConfirmUpload = async () => {
        if (!selectedImage) return;
        try {
            setLoading(true);
            setShowPreview(false);

            const imageUrl = await uploadImageToCloudinary(selectedImage.uri);
            await updateUserProfilePhoto(user.uid, imageUrl);

            setImageUri(imageUri);

            setSelectedImage(null);
            Alert.alert('Ëxito', '¡Subida de imagen con éxito!');

        } catch (error) {
            console.error("Error con la carga de la imagen", error);
            Alert.alert('Error', 'Error al cargar la imagen');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <Text>User Screen</Text>
                <View>
                    <Image source={{ uri: imageUri }} resizeMode="cover" />
                    <TouchableOpacity onPress={handlerImageSelection} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="" size="snall" />
                        ) : (
                            <Text>Cambiar Foto</Text>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user?.displayName || 'Usuario'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.principal,
    }
};

export default UserScreen;
