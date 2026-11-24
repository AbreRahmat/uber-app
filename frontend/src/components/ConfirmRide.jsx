import PropTypes from 'prop-types'
import carImage from './Images/car.jpg'
import motoImage from './Images/moto.jpg'
import autoImage from './Images/auto.jpg'

const ConfirmRide = (props) => {
    const rideFare = props.vehicleType ? props.fare?.[props.vehicleType] : undefined
    const vehicleImages = { car: carImage, moto: motoImage, auto: autoImage }
    const vehicleImage = vehicleImages[props.vehicleType] || carImage

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setConfirmRidePanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Confirm your Ride</h3>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <img className='h-20' src={vehicleImage} alt={props.vehicleType || 'Car'} />
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>From</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>To</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{rideFare ?? '--'}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
                        </div>
                    </div>
                </div>
                <button onClick={async () => {
                    if (!props.vehicleType || rideFare == null) return
                    const createdRide = await props.createRide()
                    if (!createdRide) return
                    props.setVehicleFound(true)
                    props.setConfirmRidePanel(false)

                }} className='w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>Confirm</button>
            </div>
        </div>
    )
}

ConfirmRide.propTypes = {
    createRide: PropTypes.func.isRequired,
    pickup: PropTypes.string,
    destination: PropTypes.string,
    fare: PropTypes.shape({
        car: PropTypes.number,
        moto: PropTypes.number,
        auto: PropTypes.number
    }),
    vehicleType: PropTypes.oneOf([ 'car', 'moto', 'auto' ]),
    setConfirmRidePanel: PropTypes.func.isRequired,
    setVehicleFound: PropTypes.func.isRequired
}

export default ConfirmRide