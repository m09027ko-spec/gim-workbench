export function DisclaimerBox() {
  return (
    <div className="disclaimer-box" role="note" aria-label="医療安全上の注意">
      <strong>医療安全上の注意</strong>
      <ul>
        <li>医療者向け補助ツールであり、最終判断は担当医が行う。</li>
        <li>施設プロトコル・添付文書・最新ガイドラインを優先。</li>
        <li>未確認データや薬剤量は仮実装せず、TODOとして明示。</li>
      </ul>
    </div>
  );
}
