'use client';
import { ClerkProvider } from "@clerk/nextjs";
import { SignedIn, UserButton } from "@clerk/nextjs";

function Header() {
  return (
    <header className="w-full flex z-[99] absolute p-2">
            <div className="w-full">
        
      </div>
      <div className="flex flex-row space-x-3"></div>
      

        <SignedIn>
          <UserButton />
        </SignedIn>

    </header>
  );
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

      
           
          <ClerkProvider> 

            <Header />
            <main>{children}</main>
          </ClerkProvider>
          
      
     
    
  );
}