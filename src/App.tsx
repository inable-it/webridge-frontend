import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { increment, decrement } from "@/features/counterSlice";
import { Button } from "@/components/ui/button";

function App() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Counter: {count}</h1>
      <div className="flex gap-2">
        <Button onClick={() => dispatch(increment())}>+1</Button>
        <Button onClick={() => dispatch(decrement())} variant="outline">
          -1
        </Button>
      </div>
    </div>
  );
}

export default App;
