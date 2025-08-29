import gallery from '../assets/gallery.json'


// type Photo = {
//     nom: string
//     description?: string
//     date?: string
//     filename: string
//     path: string
//     thumbnailPath: string
//     year : number
//     month : number
//     day : number
//     albumId? : string
//     TagId? : string
//   }

type PhotoLibraryProps = {
    grid: number
    objectFit: boolean
}


function PhotoLibrary({grid , objectFit}: PhotoLibraryProps) {
    

    var fit: string = objectFit ? "object-cover": "object-contain";

    return (
        <div className="photo-library p-3">
            <div 
            // className={`grid ${gap} ${cols}` }
            className="
        grid gap-3 duration-200
        [grid-template-columns:repeat(auto-fit,minmax(var(--grid,220px),1fr))]
      "
      style={{ ['--grid' as any]: `${grid}px` }}
            
            >
                {gallery.map((_, idx) => (
                    <button key={idx} className="photo aspect-square h-full overflow-clip">
                        <img className={"h-full w-full " + fit} src={gallery[idx].path} alt=""  
                        
                        />
                    </button>
                ))}
            </div>
        </div>
    )
}

export default PhotoLibrary