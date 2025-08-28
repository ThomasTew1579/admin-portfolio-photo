import Icon from "./Icon"

function TopMenu () {
    return (
        <div className="fixed top-0 z-40 left-0 h-12 w-full bg-gray-700 border-b py-3 px-5 flex items-center ">
            <div className="flex gap-5 ml-48">
                <button>
                <Icon name="expand" size={20} className=" fill-gray-200" />
                </button>
                <div className="flex items-center gap-2">
                    <Icon name="minus" size={10} className=" fill-gray-100" />
                    <input
                        className="range-scale"
                        id="teams"
                        type="range"
                        min={4}
                        max={20}
                    />
                    <Icon name="plus" size={10} className=" fill-gray-100" />
                </div>
            </div>

            <div className="flex gap-5 ml-auto">
                <button className="flex gap-2 items-center">
                    <Icon name="grid-dividers" size={18} className=" fill-gray-200" />
                    <Icon name="chevron-down" size={12} className=" fill-gray-200" />
                </button>
                <button className="flex gap-2 items-center">
                    <Icon name="tag" size={18} className=" fill-gray-200" />
                </button>
                <button className="flex gap-2 items-center">
                    <Icon name="arrow-up-from-bracket" size={18} className=" fill-gray-200" />
                </button>

            </div>

        </div>
    )
}

export default TopMenu