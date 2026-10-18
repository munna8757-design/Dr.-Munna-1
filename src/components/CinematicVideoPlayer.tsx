import React, { useState, useRef, useEffect } from 'react';
import { VoiceService } from '../services/voiceService';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Film,
  Music,
  Smile,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Share2,
  Check
} from 'lucide-react';

interface CinematicVideoPlayerProps {
  text: string;
  category: string; // 'গান' | 'ছড়া' | 'গল্প' | 'কবিতা' | string
  topic: string;
  onShare?: () => void;
}

export const CinematicVideoPlayer: React.FC<CinematicVideoPlayerProps> = ({
  text,
  category,
  topic,
  onShare
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Audio Context and recording references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const isPlayingRef = useRef(false);
  const currentLineRef = useRef(0);

  // Parse lines of the text, removing headers/metadata
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('(') && !l.startsWith('[') && !l.toLowerCase().includes('munna ai'));

  const validLines = lines.length > 0 ? lines : ['সুন্দর সকালের মিষ্টি আলো', 'পাখিদের কলতানে মন মেতেছে'];

  const isSong = category === 'গান';
  const isRhyme = category === 'ছড়া';
  const isStory = category === 'গল্প' || category === 'পোস্ট';

  // Duration per line based on genre
  const durationPerLine = isRhyme ? 2800 : isSong ? 3600 : 4200;

  // Initialize or get Web Audio Context
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        audioDestRef.current = ctx.createMediaStreamDestination();
      }
    }
    return audioCtxRef.current;
  };

  // Play genre-specific musical soundtrack
  const playGenreMusic = (step: number) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const dest = audioDestRef.current;
      const t = ctx.currentTime;

      if (isSong) {
        // Song / Musical Video: Melodic acoustic chords & bass beat
        const chords = [
          [261.63, 329.63, 392.0], // C major
          [220.0, 261.63, 329.63], // A minor
          [174.61, 220.0, 261.63], // F major
          [196.0, 246.94, 293.66]  // G major
        ];
        const chord = chords[step % chords.length];

        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.04, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          if (dest) gain.connect(dest);

          osc.start(t + idx * 0.08);
          osc.stop(t + 1.25);
        });
      } else if (isRhyme) {
        // Rhyme / Chhora: Cheerful marimba / xylophone bounce
        const rhymeNotes = [523.25, 587.33, 659.25, 783.99, 659.25, 523.25];
        const note = rhymeNotes[step % rhymeNotes.length];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, t);

        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        if (dest) gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.62);
      } else {
        // Cinema Movie / Story: Cinematic string pad & deep bass pulse
        const bassFreq = [65.41, 73.42, 82.41, 98.0][step % 4]; // C2, D2, E2, G2

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(bassFreq * 2, t);
        osc2.frequency.setValueAtTime(bassFreq, t);

        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        if (dest) gain.connect(dest);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 1.85);
        osc2.stop(t + 1.85);
      }
    } catch (_) {}
  };

  // Speak the active line in real time with sweet matching voice
  const speakActiveLine = (lineText: string) => {
    if (isMuted) return;
    VoiceService.stop();

    const pitch = isRhyme ? 1.35 : isSong ? 1.28 : 1.15;
    const rate = isRhyme ? 0.95 : isSong ? 0.88 : 0.90;

    VoiceService.speak(lineText, {
      language: 'bn',
      customPitch: pitch,
      customRate: rate
    });
  };

  // Main Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();
    let totalDuration = validLines.length * durationPerLine;
    let lastRenderedLine = -1;

    // Scenic particles
    const particleCount = isRhyme ? 30 : isSong ? 40 : 25;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: isRhyme ? Math.random() * 0.8 + 0.3 : (Math.random() - 0.5) * 0.6,
      char: isSong
        ? ['♪', '♫', '♬', '✨', '♩'][Math.floor(Math.random() * 5)]
        : isRhyme
        ? ['🌸', '⭐', '🎈', '🦋', '✨'][Math.floor(Math.random() * 5)]
        : ['✨', '✦', '·', '★'][Math.floor(Math.random() * 4)],
      color: isSong ? '#f472b6' : isRhyme ? '#fde047' : '#93c5fd'
    }));

    const render = (now: number) => {
      if (!isPlayingRef.current) {
        // Draw static preview
        drawFrame(0, 0, false);
        return;
      }

      const elapsed = now - startTime;
      const progress = (elapsed % totalDuration) / totalDuration;
      const currentIdx = Math.floor((elapsed % totalDuration) / durationPerLine);

      if (currentIdx !== lastRenderedLine) {
        lastRenderedLine = currentIdx;
        currentLineRef.current = currentIdx;
        setCurrentLineIndex(currentIdx);
        playGenreMusic(currentIdx);
        speakActiveLine(validLines[currentIdx]);
      }

      drawFrame(now, progress, true);
      animFrameRef.current = requestAnimationFrame(render);
    };

    const drawFrame = (now: number, progress: number, active: boolean) => {
      const w = canvas.width;
      const h = canvas.height;
      const lineIdx = currentLineRef.current;
      const currentLine = validLines[lineIdx] || validLines[0];

      // ==========================================
      // 1. SCENIC BACKGROUND
      // ==========================================
      if (isSong) {
        // Concert Stage / Musical Night
        const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7);
        grad.addColorStop(0, '#2d124d');
        grad.addColorStop(0.6, '#130924');
        grad.addColorStop(1, '#05020a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Sweeping stage lights
        const angle = Math.sin(now * 0.002) * 0.35;
        ctx.save();
        ctx.translate(w * 0.25, 0);
        ctx.rotate(angle);
        const beam1 = ctx.createLinearGradient(0, 0, 80, h);
        beam1.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
        beam1.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx.fillStyle = beam1;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(80, h);
        ctx.lineTo(-60, h);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(w * 0.75, 0);
        ctx.rotate(-angle);
        const beam2 = ctx.createLinearGradient(0, 0, -80, h);
        beam2.addColorStop(0, 'rgba(97, 231, 245, 0.4)');
        beam2.addColorStop(1, 'rgba(97, 231, 245, 0)');
        ctx.fillStyle = beam2;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(60, h);
        ctx.lineTo(-80, h);
        ctx.fill();
        ctx.restore();
      } else if (isRhyme) {
        // Cartoon Nature & Sunshine
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#38bdf8');
        skyGrad.addColorStop(0.6, '#bae6fd');
        skyGrad.addColorStop(1, '#86efac');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Animated Cartoon Sun
        const sunX = 70;
        const sunY = 60;
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(now * 0.001);
        ctx.fillStyle = '#fde047';
        for (let s = 0; s < 8; s++) {
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-3, -28, 6, 12);
        }
        ctx.restore();
        ctx.beginPath();
        ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();
        // Sun eyes & smile
        ctx.fillStyle = '#713f12';
        ctx.beginPath();
        ctx.arc(sunX - 5, sunY - 2, 2.5, 0, Math.PI * 2);
        ctx.arc(sunX + 5, sunY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sunX, sunY + 4, 6, 0, Math.PI);
        ctx.stroke();

        // Cartoon Hills
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(w * 0.25, h + 30, 180, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(w * 0.75, h + 20, 170, Math.PI, Math.PI * 2);
        ctx.fill();
      } else {
        // Cinema Movie Clip / Story
        const cineGrad = ctx.createLinearGradient(0, 0, w, h);
        cineGrad.addColorStop(0, '#0f172a');
        cineGrad.addColorStop(0.5, '#1e1b4b');
        cineGrad.addColorStop(1, '#020617');
        ctx.fillStyle = cineGrad;
        ctx.fillRect(0, 0, w, h);

        // Cinematic atmospheric stars
        for (let i = 0; i < 20; i++) {
          const starX = (i * 37) % w;
          const starY = (i * 19) % (h * 0.7);
          const starAlpha = 0.3 + Math.sin(now * 0.003 + i) * 0.3;
          ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
          ctx.fillRect(starX, starY, 2, 2);
        }

        // Cinematic Light Flare
        const flare = ctx.createRadialGradient(w * 0.5, h * 0.3, 10, w * 0.5, h * 0.3, 160);
        flare.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
        flare.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = flare;
        ctx.fillRect(0, 0, w, h);
      }

      // ==========================================
      // 2. PARTICLES & FLOATING SYMBOLS
      // ==========================================
      particles.forEach((p) => {
        if (active) {
          p.x += p.speedX;
          p.y -= p.speedY;
          if (p.y < -15) p.y = h + 15;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
        }
        ctx.fillStyle = p.color;
        ctx.font = '14px sans-serif';
        ctx.fillText(p.char, p.x, p.y);
      });

      // ==========================================
      // 3. ANIMATED AVATAR / CHARACTER ON STAGE
      // ==========================================
      const charX = w / 2;
      const charY = h * 0.44;
      const bobbing = active ? Math.sin(now * 0.006) * 6 : 0;

      ctx.save();
      ctx.translate(charX, charY + bobbing);

      if (isSong) {
        // Singer Avatar with microphone
        // Head
        ctx.fillStyle = '#f5cba7';
        ctx.beginPath();
        ctx.arc(0, -25, 18, 0, Math.PI * 2);
        ctx.fill();
        // Hair
        ctx.fillStyle = '#261c14';
        ctx.beginPath();
        ctx.arc(0, -28, 20, Math.PI, Math.PI * 2);
        ctx.fill();
        // Body / Dress
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(-16, -5);
        ctx.lineTo(16, -5);
        ctx.lineTo(24, 45);
        ctx.lineTo(-24, 45);
        ctx.closePath();
        ctx.fill();
        // Vintage Microphone
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(14, -18, 6, 8);
        ctx.fillRect(16, -10, 2, 45);
      } else if (isRhyme) {
        // Cute Cartoon Girl Character
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, -22, 17, 0, Math.PI * 2);
        ctx.fill();
        // Hair with ribbons
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(0, -25, 19, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        // Cute dress
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(-14, -5);
        ctx.lineTo(14, -5);
        ctx.lineTo(22, 40);
        ctx.lineTo(-22, 40);
        ctx.closePath();
        ctx.fill();
      } else {
        // Movie Actor / Heroic Silhouette
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, -25, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-18, -6);
        ctx.lineTo(18, -6);
        ctx.lineTo(22, 50);
        ctx.lineTo(-22, 50);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // ==========================================
      // 4. CINEMA LETTERBOX BARS (16:9 Movie format)
      // ==========================================
      if (isStory) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, 28);
        ctx.fillRect(0, h - 28, w, 28);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CINEMATIC 24FPS · DR. MUNNA MOVIE CLIP', 16, 18);
      }

      // ==========================================
      // 5. KARAOKE / MOVIE SUBTITLE TEXT
      // ==========================================
      ctx.textAlign = 'center';

      // Current Line
      ctx.fillStyle = isStory ? '#fde047' : '#ffffff';
      ctx.font = 'bold 20px "Noto Sans Bengali", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 10;
      ctx.fillText(currentLine, w / 2, h * 0.76);

      // Next Line Preview
      const nextIdx = (lineIdx + 1) % validLines.length;
      const nextLine = validLines[nextIdx];
      if (nextLine) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '13px "Noto Sans Bengali", sans-serif';
        ctx.shadowBlur = 0;
        ctx.fillText(nextLine, w / 2, h * 0.86);
      }

      // Title & Topic Overlay
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(
        `${isSong ? '🎵 মিউজিক ভিডিও' : isRhyme ? '🌸 ছড়া ও কার্টুন' : '🎬 সিনেমা মুভি ক্লিপ'}: ${topic || category}`,
        16,
        isStory ? 45 : 22
      );

      // Progress Line
      const barY = isStory ? h - 32 : h - 12;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(16, barY, w - 32, 4);

      ctx.fillStyle = isStory ? '#fde047' : isSong ? '#ec4899' : '#38bdf8';
      ctx.fillRect(16, barY, (w - 32) * progress, 4);
    };

    if (isPlaying) {
      isPlayingRef.current = true;
      startTime = performance.now();
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      isPlayingRef.current = false;
      drawFrame(0, 0, false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      VoiceService.stop();
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      VoiceService.stop();
    };
  }, [isPlaying, isSong, isRhyme, isStory, isMuted, validLines, topic, category, durationPerLine]);

  // Record Canvas Video with Audio Destination mixing
  const handleRecordVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecording(true);
      setRecordedVideoUrl(null);
      recordedChunksRef.current = [];

      // Ensure playback is running
      if (!isPlaying) {
        setIsPlaying(true);
      }

      const canvasStream = canvas.captureStream(30);
      const audioCtx = getAudioContext();
      const dest = audioDestRef.current;

      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
      if (dest && dest.stream.getAudioTracks().length > 0) {
        tracks.push(...dest.stream.getAudioTracks());
      }

      const combinedStream = new MediaStream(tracks);
      const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

      // Automatically capture complete movie clip (16 seconds)
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 15000);
    } catch (e) {
      console.warn('Record video error', e);
      setIsRecording(false);
    }
  };

  const handleDownload = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `dr-munna-${isSong ? 'song-video' : isRhyme ? 'rhyme-video' : 'movie-clip'}-${Date.now()}.webm`;
    a.click();
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      VoiceService.stop();
    } else {
      setIsPlaying(true);
      getAudioContext();
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#0b1020] border-2 border-cyan-500/40 rounded-3xl p-4 shadow-2xl space-y-3 animate-fade-in"
    >
      {/* Video Studio Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
            {isSong ? (
              <Music className="w-4 h-4 text-pink-400" />
            ) : isRhyme ? (
              <Smile className="w-4 h-4 text-amber-400" />
            ) : (
              <Film className="w-4 h-4 text-cyan-400" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <span>
                {isSong
                  ? 'শিল্পীর কণ্ঠে মিউজিক্যাল গান ও ভিডিও'
                  : isRhyme
                  ? 'সুরেলা ছড়া ও কার্টুন অ্যানিমেশন'
                  : 'সিনেমা মুভি ক্লিপ (Cinema Movie Clip)'}
              </span>
              {isPlaying && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </span>
            <p className="text-[10px] text-gray-400">
              {isSong
                ? 'শিল্পীর কণ্ঠ, স্টেজ লাইট ও সাবটাইটেল সিঙ্ক'
                : isRhyme
                ? 'ছড়ার ছন্দ, কার্টুন ক্যারেক্টার ও মনোরম দৃশ্য'
                : 'সিনেম্যাটিক আবহ, ভয়েস ন্যারেশন ও ডায়ালগ'}
            </p>
          </div>
        </div>

        {/* Video Controls: Mute, Play/Pause, Record */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-[#151d33] border border-gray-700 text-gray-300 hover:text-white transition"
            title={isMuted ? 'সাউন্ড আনমিউট' : 'মিউট'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={togglePlay}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition ${
              isPlaying
                ? 'bg-amber-500 text-black shadow-amber-500/30'
                : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-black shadow-cyan-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'পজ' : 'মুভি প্লে করুন'}</span>
          </button>

          <button
            onClick={handleRecordVideo}
            disabled={isRecording}
            className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition shadow-lg shadow-rose-600/30"
          >
            <div className={`w-2.5 h-2.5 rounded-full bg-white ${isRecording ? 'animate-ping' : ''}`} />
            <span>{isRecording ? 'রেকর্ড হচ্ছে…' : 'ভিডিও সেভ'}</span>
          </button>
        </div>
      </div>

      {/* Main Movie & Animation Screen Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-black aspect-[16/9] shadow-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-contain"
        />

        {/* Play Overlay if Paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center text-black font-extrabold shadow-2xl group-hover:scale-110 transition">
              <Play className="w-8 h-8 fill-current ml-1 text-black" />
            </div>
            <p className="mt-3 text-xs font-bold text-white drop-shadow">
              ক্লিক করে সম্পূর্ণ মুভি ক্লিপ দেখুন ও শুনুন
            </p>
          </div>
        )}
      </div>

      {/* Download Video Action Banner */}
      {recordedVideoUrl && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl flex items-center justify-between text-xs text-emerald-200 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span className="font-bold">🎬 সম্পূর্ণ মুভি ক্লিপ প্রস্তুত হয়েছে! (সাউন্ড ও সাবটাইটেল সহ)</span>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-500/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>মোবাইলে ডাউনলোড (.webm)</span>
          </button>
        </div>
      )}
    </div>
  );
};
