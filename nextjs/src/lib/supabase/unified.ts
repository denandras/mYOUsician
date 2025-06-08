import {SupabaseClient} from "@supabase/supabase-js";
import {Database} from "@/lib/types";

export enum ClientType {
    SERVER = 'server',
    SPA = 'spa'
}

export class SassClient {
    private client: SupabaseClient<Database>;
    private clientType: ClientType;

    constructor(client: SupabaseClient, clientType: ClientType) {
        this.client = client;
        this.clientType = clientType;

    }

    async loginEmail(email: string, password: string) {
        return this.client.auth.signInWithPassword({
            email: email,
            password: password
        });
    }

    async registerEmail(email: string, password: string) {
        // Attempt to sign up
        const signUpResult = await this.client.auth.signUp({
            email: email,
            password: password
        });

        // Handle explicit Supabase errors first
        if (signUpResult.error) {
            const errorMessage = signUpResult.error.message.toLowerCase();
            
            if (errorMessage.includes('user already registered') || 
                errorMessage.includes('already registered') ||
                errorMessage.includes('email address already in use') ||
                errorMessage.includes('email rate limit exceeded')) {
                return {
                    data: { user: null, session: null },
                    error: {
                        message: 'An account with this email address already exists. Please sign in instead or check your email for a verification link.',
                        status: 409,
                        name: 'AuthError'
                    } as any
                };
            }
            
            return signUpResult;
        }

        // When confirmations are enabled and there's a user but no session,
        // we need to determine if this is a new signup or existing user
        if (signUpResult.data?.user && !signUpResult.data.session) {
            const user = signUpResult.data.user;
            
            // If email is not confirmed, check if this is an existing user
            if (!user.email_confirmed_at) {
                const userCreatedAt = new Date(user.created_at);
                const now = new Date();
                const timeDiff = now.getTime() - userCreatedAt.getTime();
                
                // If user was created more than 10 seconds ago, it's an existing user
                if (timeDiff > 10000) {
                    return {
                        data: { user: null, session: null },
                        error: {
                            message: 'An account with this email address already exists but has not been verified. Please check your email for a verification link, or click the "Resend verification" link if you need a new one.',
                            status: 409,
                            name: 'AuthError'
                        } as any
                    };
                }
            }
            
            // If email is already confirmed, definitely a duplicate
            if (user.email_confirmed_at) {
                return {
                    data: { user: null, session: null },
                    error: {
                        message: 'An account with this email address already exists and is verified. Please sign in instead.',
                        status: 409,
                        name: 'AuthError'
                    } as any
                };
            }
        }

        return signUpResult;
    }

    async exchangeCodeForSession(code: string) {
        return this.client.auth.exchangeCodeForSession(code);
    }

    async resendVerificationEmail(email: string) {
        return this.client.auth.resend({
            email: email,
            type: 'signup'
        })
    }

    async logout() {
        const { error } = await this.client.auth.signOut({
            scope: 'local'
        });
        if (error) throw error;
        if(this.clientType === ClientType.SPA) {
            window.location.href = '/auth/login';
        }
    }

    async uploadFile(myId: string, filename: string, file: File) {
        filename = filename.replace(/[^0-9a-zA-Z!\-_.*'()]/g, '_');
        filename = myId + "/" + filename
        return this.client.storage.from('files').upload(filename, file);
    }

    async getFiles(myId: string) {
        return this.client.storage.from('files').list(myId)
    }

    async deleteFile(myId: string, filename: string) {
        filename = myId + "/" + filename
        return this.client.storage.from('files').remove([filename])
    }

    async shareFile(myId: string, filename: string, timeInSec: number, forDownload: boolean = false) {
        filename = myId + "/" + filename
        return this.client.storage.from('files').createSignedUrl(filename, timeInSec, {
            download: forDownload
        });

    }

    getSupabaseClient() {
        return this.client;
    }


}
