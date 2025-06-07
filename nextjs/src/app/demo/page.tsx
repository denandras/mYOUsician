import { ProfileModalDemo } from '@/components/ProfileModalDemo';

export default function ProfileModalDemoPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">ProfileQueryModal Demo</h1>
                    <p className="text-muted-foreground mt-2">
                        Test the improved mobile responsiveness and error handling
                    </p>
                </div>
                <ProfileModalDemo />
            </div>
        </div>
    );
}
