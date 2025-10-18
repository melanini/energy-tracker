import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8" style={{ backgroundColor: '#f8f5f2' }}>
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#f5855f] via-[#960047] to-[#953599] bg-clip-text text-transparent mb-2">
            Create your account
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">Start tracking your energy today</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-gradient-to-r from-[#f5855f] via-[#960047] to-[#953599] hover:opacity-90 text-white font-medium text-sm sm:text-base py-3 sm:py-4',
              card: 'shadow-lg border-neutral-200 w-full',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border-neutral-200 hover:bg-neutral-50 text-sm sm:text-base py-3 sm:py-4 transition-colors',
              socialButtonsBlockButtonText: 'text-neutral-700 font-medium',
              socialButtonsBlockButtonArrow: 'text-neutral-500',
              formFieldInput: 'border-neutral-200 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base py-3 sm:py-4',
              footerActionLink: 'text-purple-600 hover:text-purple-700 text-sm sm:text-base',
              formFieldLabel: 'text-sm sm:text-base',
              footerActionText: 'text-sm sm:text-base',
              identityPreviewText: 'text-sm text-neutral-600',
              identityPreviewEditButton: 'text-purple-600 hover:text-purple-700',
              formResendCodeLink: 'text-purple-600 hover:text-purple-700',
              otpCodeFieldInput: 'border-neutral-200 focus:border-purple-500 focus:ring-purple-500',
            }
          }}
          redirectUrl="/home"
          signInUrl="/auth/signin"
          forceRedirectUrl="/home"
        />
      </div>
    </div>
  );
}

