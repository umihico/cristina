export const Loader = () => {
  return (
    <div className="fixed top-0 left-0 bg-black bg-opacity-80 w-full h-screen z-30 flex justify-center items-center">
      <div className="flex justify-center">
        <div className="animate-spin h-96 w-96 border-8 border-gray-500 rounded-full border-t-transparent"></div>
      </div>
    </div>
  );
};
