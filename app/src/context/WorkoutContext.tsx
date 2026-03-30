import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type WorkoutContextType = {
  isActive: boolean;
  planId: number | null;
  planName: string;
  seconds: number;
  modalVisible: boolean;
  startWorkout: (planId: number, planName: string) => void;
  stopWorkout: () => void;
  showModal: () => void;
  hideModal: () => void;
};

const WorkoutContext = createContext<WorkoutContextType>({
  isActive: false,
  planId: null,
  planName: "",
  seconds: 0,
  modalVisible: false,
  startWorkout: () => {},
  stopWorkout: () => {},
  showModal: () => {},
  hideModal: () => {},
});

export const useWorkout = () => useContext(WorkoutContext);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [planId, setPlanId] = useState<number | null>(null);
  const [planName, setPlanName] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startWorkout = useCallback(
    (id: number, name: string) => {
      stopTimer();
      setPlanId(id);
      setPlanName(name);
      setIsActive(true);
      setSeconds(0);
      setModalVisible(true);
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    },
    [stopTimer],
  );

  const stopWorkout = useCallback(() => {
    stopTimer();
    setIsActive(false);
    setPlanId(null);
    setPlanName("");
    setSeconds(0);
    setModalVisible(false);
  }, [stopTimer]);

  const showModal = useCallback(() => setModalVisible(true), []);
  const hideModal = useCallback(() => setModalVisible(false), []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  return (
    <WorkoutContext.Provider
      value={{
        isActive,
        planId,
        planName,
        seconds,
        modalVisible,
        startWorkout,
        stopWorkout,
        showModal,
        hideModal,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}
