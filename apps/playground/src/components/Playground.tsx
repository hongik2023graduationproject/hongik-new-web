"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { initFromStorage, setCode } from "@/store/playgroundSlice";
import { Header } from "./Header";
import { EditorPanel } from "./EditorPanel";
import { ConsolePanel } from "./ConsolePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function Playground() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.playground.theme);
  const searchParams = useSearchParams();

  useEffect(() => {
    dispatch(initFromStorage());

    // URL ?code= parameter takes priority over localStorage
    const codeParam = searchParams.get("code");
    if (codeParam) {
      dispatch(setCode(codeParam));
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header />

      {/* Desktop layout */}
      <div className="hidden flex-1 overflow-hidden md:flex">
        <div className="flex-[7] overflow-hidden">
          <EditorPanel />
        </div>
        <Separator orientation="vertical" />
        <div className="flex-[3] overflow-hidden">
          <ConsolePanel />
        </div>
      </div>

      {/* Mobile layout with tabs */}
      <div className="flex flex-1 flex-col overflow-hidden md:hidden">
        <Tabs defaultValue="editor" className="flex flex-1 flex-col">
          <TabsList className="mx-4 mt-2 grid w-auto grid-cols-2">
            <TabsTrigger value="editor">에디터</TabsTrigger>
            <TabsTrigger value="console">콘솔</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="flex-1 overflow-hidden">
            <EditorPanel />
          </TabsContent>
          <TabsContent value="console" className="flex-1 overflow-hidden">
            <ConsolePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
