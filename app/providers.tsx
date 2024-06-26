'use client';

// ------------------------------------------------------ Next ---------------------------------------------------------
import { useEffect } from 'react';
import { useCookies } from 'next-client-cookies';
import { usePathname, useRouter } from 'next/navigation';

// ------------------------------------------------------ Hooks --------------------------------------------------------
import { useAppDispatch, useAppSelector } from '@lib/hooks';
import { AuthState, setAuth, setIsLogged } from '@lib/features/auth/authSlice';

// ------------------------------------------------------ Utils --------------------------------------------------------
import { jwtDecode } from 'jwt-decode';
import { Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import Navbar from '@components/Navbar/Navbar';

const Providers = ({ children }: { children: React.ReactNode }) => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const cookies = useCookies();
	const path = usePathname();

	const isLogged = useAppSelector(state => state.auth.isLogged);

	useEffect(() => {
		if (!router || !cookies || !path || !dispatch) {
			return;
		}

		if (!path.startsWith('/auth')) {
			const token = cookies.get('token');

			if (token) {
				getUser(token, dispatch);
			} else {
				router.push('/auth/signin');
			}
		} else {
			if (isLogged) {
				router.push('/');
			}
		}
	}, [cookies, router, path, isLogged, dispatch]);

	return (
		<>
			{!path.startsWith('/auth') && cookies.get('token') ? (
				<Navbar />
			) : (
				<></>
			)}
			{children}
		</>
	);
};

export default Providers;

const getUser = async (
	token: string,
	dispatch: ThunkDispatch<
		{
			auth: AuthState;
		},
		undefined,
		UnknownAction
	> &
		Dispatch<UnknownAction>
) => {
	const userId = jwtDecode(token).sub;

	if (!userId) return;

	try {
		const response = await fetch(
			`https://studentlink.etudiants.ynov-bordeaux.com/api/users/${userId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		const user = await response.json();

		dispatch(setAuth(user));
	} catch (error) {
		console.error(error);
	}
};
