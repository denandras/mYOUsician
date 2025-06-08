import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;
    const testimonials = [
        {
            quote: "Why is there no such a platform already? It would be so easy to find those who you study with but do not understand in such a database",
            author: "Zoltán Körösvölgyi",
            role: "Art Management Teacher at Liszt Ferenc Academy of Music",
            avatar: "ZK"
        },
    ];

    return (
        <div className="flex min-h-screen">
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative">
                <Link
                    href="/"
                    className="absolute left-8 top-8 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Homepage
                </Link>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link href="/" className="block text-center">
                      <Image 
                        src="/branding/text_teal.svg" 
                        alt={productName || "mYOUsician"}
                        width={120}
                        height={48}
                        className="h-12 w-auto mx-auto"
                      />
                    </Link>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    {children}
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800">
                <div className="w-full flex items-center justify-center p-12">
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-white text-2xl font-bold mb-8">
                            Trusted by musicians just like you!
                        </h3>
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-xl"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-primary-400/30 flex items-center justify-center text-white font-semibold">
                                            {testimonial.avatar}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white/90 mb-2 font-light leading-relaxed">
                                            &#34;{testimonial.quote}&#34;
                                        </p>
                                        <div className="mt-3">
                                            <p className="text-sm font-medium text-white">
                                                {testimonial.author}
                                            </p>
                                            <p className="text-sm text-primary-200">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="mt-8 text-center">
                            <p className="text-primary-100 text-sm">
                                Join others who registered to {productName}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}