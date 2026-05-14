import { useState } from "react";
import { message } from "antd";

import SvgIcon from "@/components/SvgIcon";
import iconNames from "virtual:svg-icons-names";

import "./index.css";

export default function SvgIconPage() {
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const handleCopy = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedName(name);
      message.success(`已复制: ${name}`);
      setTimeout(() => {
        setCopiedName(null);
      }, 2000);
    } catch (err) {
      console.error("复制失败:", err);
      message.error("复制失败");
    }
  };

  return (
    <div className="svg-icon-page">
      <div className="svg-icon-header">
        <h1 className="svg-icon-title">SVG 图标图鉴</h1>
        <p className="svg-icon-desc">点击图标可复制文件名，共 {iconNames.length} 个图标</p>
      </div>
      <div className="svg-icon-grid">
        {iconNames.map((fullName) => {
          const name = fullName.replace("icon-", "");
          return (
            <div
              key={fullName}
              className={`svg-icon-item ${copiedName === name ? "copied" : ""}`}
              onClick={() => handleCopy(name)}
            >
              <SvgIcon name={name} width={48} height={48} />
              <span className="svg-icon-name">{name}</span>
              {copiedName === name && (
                <span className="svg-icon-copied">✓ 已复制</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
