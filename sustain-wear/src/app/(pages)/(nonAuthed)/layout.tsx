function Header ( ) {
  return (       
    <header className='w-full flex z-99 absolute p-4'>
        <div className='w-full'>
            
        </div>
        <div className="flex flex-row space-x-3">
    
        </div>
    </header>
  )
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <Header />
        {children}
    </>

  );
}
