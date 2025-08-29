import Icon from "./Icon"

type Props = {
  fit: boolean
  grid: number
  onToggleFit: () => void
  onGridChange: (n: number) => void
}

function TopMenu({ grid, onToggleFit, onGridChange }: Props) {
    return (
      <div className="fixed top-0 z-40 left-0 h-topbar w-full bg-gray-700 border-b py-3 px-5 flex items-center">
        <div className="flex pl-sidebar justify-between w-full">
          <div className="flex gap-5 ">
            <button onClick={onToggleFit}>
              <Icon name="expand" size={20} className="fill-gray-200" />
            </button>
  
            <div className="flex items-center gap-2">
            <button onClick={() => onGridChange(grid - 30)}>
                <Icon name="minus" size={10} className="fill-gray-100" />
            </button>
              <input
                className="range-scale"
                type="range"
                min={120}
                max={300}
                value={grid}            
                onChange={(e) => onGridChange(Number(e.target.value))}
              />
              <button onClick={() => onGridChange(grid + 30)}>
                <Icon name="plus" size={10} className="fill-gray-100" />
            </button>
            </div>
          </div>
          <div className="filter grid grid-cols-3 border-[0.5px] border-gray-200 font-light text-xs rounded-md text-gray-100 *:after:absolute *:after:text-gray-300 *:after:-right-0.5 *:relative *:after:content-['_|_'] *:py-1 *:px-3 *:rounded-sm"> 
            <button className=""> 
                Année 
            </button> 
            <button className=" "> 
                Mois 
            </button> 
            <button className="bg-gray-300 after:hidden"> 
                Toutes les photos 
            </button> 
            </div> <div className="flex gap-5 "> 
                <button className="flex gap-2 items-center"> 
                    <Icon name="grid-dividers" size={18} className=" fill-gray-200" /> <Icon name="chevron-down" size={12} className=" fill-gray-200" /> 
                    </button> 
                <button className="flex gap-2 items-center"> 
                    <Icon name="tag" size={18} className=" fill-gray-200" /> 
                    </button> 
                <button className="flex gap-2 items-center"> 
                    <Icon name="arrow-up-from-bracket" size={18} className=" fill-gray-200" /> 
                    </button> 
                </div>
        </div>
      </div>
    )
  }

export default TopMenu