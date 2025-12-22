import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { UserService } from '../../services/UserService';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

const SignUpSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Too Short!').required('Required'),
});

const SignUpScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const handleSignUp = async (values: any) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            await updateProfile(userCredential.user, {
                displayName: values.name
            });

            // Save user profile to Firestore for search functionality
            await UserService.upsertUserProfile(userCredential.user.uid, {
                uid: userCredential.user.uid,
                displayName: values.name,
                email: values.email,
                photoURL: null,
                createdAt: new Date(),
            });

            // Navigation handled by auth state listener
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="displayMedium" style={styles.title}>Create Account</Text>

            <Formik
                initialValues={{ name: '', email: '', password: '' }}
                validationSchema={SignUpSchema}
                onSubmit={handleSignUp}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                    <View style={styles.form}>
                        <TextInput
                            label="Full Name"
                            value={values.name}
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            mode="outlined"
                            error={touched.name && !!errors.name}
                            style={styles.input}
                        />
                        <HelperText type="error" visible={touched.name && !!errors.name}>
                            {errors.name}
                        </HelperText>

                        <TextInput
                            label="Email"
                            value={values.email}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            mode="outlined"
                            error={touched.email && !!errors.email}
                            style={styles.input}
                            autoCapitalize="none"
                        />
                        <HelperText type="error" visible={touched.email && !!errors.email}>
                            {errors.email}
                        </HelperText>

                        <TextInput
                            label="Password"
                            value={values.password}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            secureTextEntry
                            mode="outlined"
                            error={touched.password && !!errors.password}
                            style={styles.input}
                        />
                        <HelperText type="error" visible={touched.password && !!errors.password}>
                            {errors.password}
                        </HelperText>

                        <Button
                            mode="contained"
                            onPress={() => handleSubmit()}
                            loading={isSubmitting}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                        >
                            Sign Up
                        </Button>
                    </View>
                )}
            </Formik>

            <View style={styles.footer}>
                <Text>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: responsiveWidth(8),
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: responsiveHeight(6),
        fontWeight: '900',
        fontSize: responsiveFontSize(4),
    },
    form: {
        marginBottom: responsiveHeight(3),
    },
    input: {
        marginBottom: responsiveHeight(1),
    },
    button: {
        marginTop: responsiveHeight(2),
        borderRadius: responsiveWidth(3),
    },
    buttonContent: {
        paddingVertical: responsiveHeight(1.2),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: responsiveHeight(5),
    },
});

export default SignUpScreen;
