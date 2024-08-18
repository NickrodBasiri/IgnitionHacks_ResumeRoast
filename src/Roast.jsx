import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { promptGemini } from "./api/gemini";
import { getAudio } from "./api/elevenlabs";

export default function Roast() {
  const location = useLocation();
  const navigate = useNavigate();
  const resumeText = location.state?.resumeText;
  const pdfData = location.state?.pdfData;
  const [lyrics, setLyrics] = useState("");
  const [displayLyrics, setDisplayLyrics] = useState([]);
  const [dissAudio, setDissAudio] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const drakeVoiceID = "9VZnLb0qx35CBHf8XXqS";

  useEffect(() => {
    if (resumeText !== undefined) {
      const prompt = `I want you to write a diss track for my resume as Drake. 
      Make it clear Drake is dissing my resume. Targetting specific pieces of 
      information from it (or information missing). Dont comment on any bad formatting 
      or random characters. Write 4 verses of 4 lines each. ${resumeText}`;

      promptGemini(prompt, setLyrics);
    }
  }, [resumeText]);

  useEffect(() => {
    if (lyrics) {
      const dispLyrics = lyrics.split("\n\n");

      var lyricsList = [];

      dispLyrics.forEach(function (item, index) {
        lyricsList.push(item.split("\n"));
      });

      console.log(lyricsList);
      setDisplayLyrics(lyricsList);

      getAudio(lyrics, drakeVoiceID, setDissAudio);
    }
  }, [lyrics]);

  useEffect(() => {
    if (dissAudio) {
      dissAudio.addEventListener("ended", () => {
        setIsPlaying(false);
      });
    }
  }, [dissAudio]);

  const playAudio = () => {
    dissAudio.play();
    setHasPlayedOnce(true);
    setIsPlaying(true);
  };

  const downloadAudio = () => {
    const link = document.createElement("a");

    link.download = "dissed_resume.mp3";
    link.href = dissAudio.src;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative bg-gradient-to-b from-zinc-700 to-zinc-900 w-screen h-screen overflow-hidden">
      <span className="flex gap-10 p-10">
        <i
          className="text-5xl text-white cursor-pointer fa-house fa-solid"
          onClick={() => {
            navigate("/");
          }}
        />
        {dissAudio && (
          <i
            className="text-5xl text-white cursor-pointer fa-download fa-solid"
            onClick={downloadAudio}
          />
        )}
      </span>
      <img
        src="drakeRapping.png"
        className="-bottom-80 -left-96 absolute scale-50"
      />
      <div className="top-20 right-40 absolute">
        <div className="relative flex items-center border-4 border-white bg-zinc-400 p-10 rounded-xl w-[40rem] h-[30rem]">
          {dissAudio ? (
            hasPlayedOnce ? (
              <div>
                <br></br>
                {displayLyrics.map((block, index) => (
                  <div>
                    {block.map((verse, subIndex) => (
                      <p>{verse}</p>
                    ))}
                    <br></br>
                  </div>
                ))}
              </div>
            ) : (
              <i
                onClick={playAudio}
                className="text-8xl text-white fa-play fa-solid"
              ></i>
            )
          ) : (
            <div className="border-4 border-t-transparent border-blue-500 border-solid rounded-full w-12 h-12 animate-spin b"></div>
          )}
          {!isPlaying && hasPlayedOnce && (
            <i
              onClick={playAudio}
              className="fa-rotate-right right-8 bottom-8 absolute text-4xl text-white fa-solid"
            ></i>
          )}
        </div>
      </div>

      <p
        onClick={() => {
          navigate("/feedback", {
            state: { resumeText: resumeText, pdfData: pdfData },
          });
        }}
        className="right-10 bottom-10 absolute text-3xl text-white cursor-pointer"
      >
        Get help →
      </p>
    </div>
  );
}
