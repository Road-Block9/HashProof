import Navbar from "./Navbar.jsx";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-cryptoBeige relative overflow-hidden flex items-center justify-center p-4 sm:p-8 md:p-12">
      {/* The Massive Main Container */}
      <div className="relative w-full max-w-[1400px] min-h-[85vh] rounded-[40px] overflow-hidden shadow-crypto-container flex flex-col bg-cryptoBlack">
        
        {/* The Two-Tone Split: Top Half Golden-Yellow */}
        <div className="absolute top-0 left-0 w-full h-[55%] bg-cryptoYellow z-0 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col flex-1">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8 lg:px-12 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
