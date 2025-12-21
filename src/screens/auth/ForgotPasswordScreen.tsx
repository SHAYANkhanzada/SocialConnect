import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
});

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const handleReset = async (values: any) => {
        try {
            await sendPasswordResetEmail(auth, values.email);
            Alert.alert('Success', 'Password reset email sent! Check your inbox.');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="displayMedium" style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a password reset link.</Text>

            <Formik
                initialValues={{ email: '' }}
                validationSchema={ForgotPasswordSchema}
                onSubmit={handleReset}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                    <View style={styles.form}>
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

                        <Button
                            mode="contained"
                            onPress={() => handleSubmit()}
                            loading={isSubmitting}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                        >
                            Send Reset Link
                        </Button>
                    </View>
                )}
            </Formik>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={{ color: theme.colors.primary }}>Back to Login</Text>
            </TouchableOpacity>
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
        marginBottom: responsiveHeight(1),
        fontWeight: '900',
        fontSize: responsiveFontSize(3.5),
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: responsiveHeight(6),
        color: '#64748b', // Slate 500
        fontSize: responsiveFontSize(1.8),
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
    backButton: {
        alignItems: 'center',
        marginTop: responsiveHeight(2.5),
    },
});

export default ForgotPasswordScreen;
