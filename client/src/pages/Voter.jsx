import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Navigation from "./Navigation";
import { toast } from "sonner";

const Voter = ({ state, handleCase }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleVoterInfo = async (event) => {
    event.preventDefault();
    const voterInfo = {
      name: handleCase(document.querySelector("#nameV").value),
      age: handleCase(document.querySelector("#ageV").value),
      gender: handleCase(document.querySelector("#genderV").value),
    };

    try {
      if (!voterInfo.name || !voterInfo.age || !voterInfo.gender) {
        toast.warning("Some fields are empty. Proceeding to the vote page.");
      } else {
        await state.contract.voterRegister.send(voterInfo.name, voterInfo.age, voterInfo.gender);
        toast.success(`Voter ${voterInfo.name} registered successfully`);
      }
      navigate("/Vote"); // Navigate to the vote page
    } catch (error) {
      console.table(error.shortMessage);
      toast.error(error.reason);
      navigate("/Vote"); // Navigate to the vote page even on error
    }
  };

  return (
    <>
      <div className="flex  h-[100%] space-x-32">
        <Navigation />
        <div className="w-[60%] h-[70%]">
          <div className="grid grid-flow-col gap-10">

            {/* voter registration starts */}
            <div className="flex flex-col justify-center items-center mt-[10%]">
              <h1 className="mb-10 tracking-wide text-gray-600 dark:text-gray-400 text-2xl ">
                Voter Registration
              </h1>

              {/* Form for voter registraation starts here */}
              <form className="grid grid-rows-2 grid-flow-col gap-10 justify-center" onSubmit={handleVoterInfo}>
                <div className="grid grid-rows-3 grid-flow-col gap-10">
                    <div className="w-[100%] col-span-10 rounded-3xl p-px bg-gradient-to-b from-blue-300 to-pink-300 dark:from-blue-800 dark:to-purple-800 transition-all duration-700 hover:shadow-[0_3px_10px_rgb(0.4,0.4,0.4,0.4)] dark:hover:shadow-cyan-500/50 ">
                    <input className="rounded-[calc(1.5rem-1px)] p-6 w-[100%] bg-white dark:bg-gray-900 dark:text-slate-200  h-10" placeholder='First name' name='nameV' id='nameV'></input>
                    </div>

                    <div className="w-[100%] col-span-10 rounded-3xl p-px bg-gradient-to-b from-blue-300 to-pink-300 dark:from-blue-800 dark:to-purple-800 transition-all duration-700 hover:shadow-[0_3px_10px_rgb(0.4,0.4,0.4,0.4)] dark:hover:shadow-cyan-500/50 ">
                    <input className="rounded-[calc(1.5rem-1px)] p-6 w-[100%] bg-white dark:bg-gray-900 dark:text-slate-200  h-10" placeholder='Last name' name='nameV' id='nameV'></input>
                    </div>

                    <div className="w-[100%] col-span-10 rounded-3xl p-px bg-gradient-to-b from-blue-300 to-pink-300 dark:from-blue-800 dark:to-purple-800 transition-all duration-700 hover:shadow-[0_3px_10px_rgb(0.4,0.4,0.4,0.4)] dark:hover:shadow-cyan-500/50 ">
                    <input className="rounded-[calc(1.5rem-1px)] p-6 w-[100%] bg-white dark:bg-gray-900 dark:text-slate-200  h-10" placeholder='Enter age' name='ageV' id='ageV' ></input>
                    </div>

                    <div className="w-[100%] col-span-10 rounded-3xl p-px bg-gradient-to-b from-blue-300 to-pink-300 dark:from-blue-800 dark:to-purple-800 transition-all duration-700 hover:shadow-[0_3px_10px_rgb(0.4,0.4,0.4,0.4)] dark:hover:shadow-cyan-500/50 ">
                    <input className="rounded-[calc(1.5rem-1px)] p-6 w-[100%] bg-white dark:bg-gray-900 dark:text-slate-200  h-10" placeholder='Middle name' name='nameV' id='nameV'></input>
                    </div>

                    <div className="w-[100%] col-span-10 rounded-3xl p-px bg-gradient-to-b from-blue-300 to-pink-300 dark:from-blue-800 dark:to-purple-800 transition-all duration-700 hover:shadow-[0_3px_10px_rgb(0.4,0.4,0.4,0.4)] dark:hover:shadow-cyan-500/50 ">
                    <input className="rounded-[calc(1.5rem-1px)] p-6 w-[100%] bg-white dark:bg-gray-900 dark:text-slate-200  h-10" placeholder='Enter gender' name='genderV' id='genderV'></input>
                    </div>

                    <div className="w-[100%] col-span-9  rounded-3xl p-px bg-gradient-to-b from-blue-300 to-pink-300 dark:from-blue-800 dark:to-purple-800 transition-all duration-700 hover:shadow-[0_3px_10px_rgb(0.4,0.4,0.4,0.4)] dark:hover:shadow-cyan-500/50 ">
                            <input className="rounded-[calc(1.5rem-1px)] p-6 w-[100%] bg-white dark:bg-gray-900 dark:text-slate-200  h-10" placeholder='Enter Voter Id' name='voter Id' id='voterId' type='number' ></input>
                        </div>
                        
                </div>

                {/* Button */}
                 <div className='w-[100%] rounded-3xl p-px '>
                    <button className="relative inline-flex ml-80 items-center justify-center  p-0.5 rounded-full  mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900  group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 transition-all  duration-200 shadow-[0_3px_10px_rgb(0.4,0.4,0.4,0.4)]" type='submit'>
                    <span className="relative px-5 py-2 transition-all rounded-calc(1.5rem- 1px)] ease-in-out duration-700 bg-white dark:bg-gray-900 rounded-full group-hover:bg-opacity-0">
                        Register
                    </span>
                    </button> 
                </div>

              </form>
              {/* Form for voter registraation ends here */}

            </div>
            {/* voter registration ends */}

          </div>
        </div>
      </div>
    </>
  );
};

export default Voter;
