export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-gray-800 bg-gradient-to-br from-[#eaf1f8] via-[#f6f8fb] to-[#eef1f6]">
      <div className="max-w-3xl bg-white/70 backdrop-blur-md p-10 rounded-2xl shadow-md">
        <h1 className="text-4xl font-bold text-[#4A6FA5] mb-6 text-center">Privacy Policy</h1>
        <p className="text-gray-600 leading-relaxed mb-4">
          At <strong>Tiffin Mess</strong>, we respect your privacy. We collect your information
          solely to provide and improve our services — including user authentication, order
          management, and personalized meal experiences.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          We never share your personal data with third parties except for secure payment or delivery
          services required to complete your orders.
        </p>
        <p className="text-gray-600 leading-relaxed">
          By using our platform, you consent to our privacy policy. For any questions, reach out to
          us through our <a href="/contact" className="text-[#4A6FA5] font-medium underline">Contact</a> page.
        </p>
      </div>
    </div>
  );
}
