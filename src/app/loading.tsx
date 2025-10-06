export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#eaf1f8] via-[#f6f8fb] to-[#eef1f6] text-[#4A6FA5]">
      <div className="w-16 h-16 border-4 border-[#4A6FA5] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium">Loading, please wait...</p>
    </div>
  );
}
